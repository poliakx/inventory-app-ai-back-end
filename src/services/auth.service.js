import { pool } from "../db/pool.js";
import { userRepository } from "../repositories/user.repository.js";
import { organizationRepository } from "../repositories/organizations.repository.js";
import { refreshTokenRepository } from "../repositories/token.repository.js";
import { hashRefreshToken } from "../infrastructure/auth/helpers/tokenHash.js";
import { NotFoundError, ConflictError } from "../errors/base.error.js";
import {
  InvalidCredentialsError,
  TokenReuseDetectedError,
  InvalidTokenError,
} from "../errors/autorization/authErrors.js";
import { signAccessToken, signRefreshToken } from "../infrastructure/auth/tokens.js";
import { verifyRefreshToken } from "../infrastructure/auth/verify-jwt-token.js";
import { transactionFunc } from "../db/transaction.js";
import { expiresAt } from "../infrastructure/auth/helpers/refreshTokenExpiresAt.js";
import {
  hashPassword,
  comparePassword,
} from "../infrastructure/auth/helpers/passwordHash.js";
import { v4 as uuidv4 } from "uuid";
import { logger } from "../config/logger.js";

export const authService = {
  register: async ({ name, email, password, organizationName }) => {
    return transactionFunc(async (db) => {
      const existingUser = await userRepository.findByEmail(email, db);

      if (existingUser) {
        throw new ConflictError("User already exists");
      }

      const passwordHash = await hashPassword(password);

      const organization = await organizationRepository.createOrganization(
        organizationName,
        db
      );

      const newUser = await userRepository.createUser(
        {
          name,
          email,
          passwordHash,
          role: "admin",
          organization_id: organization.id,
        },
        db
      );

      return newUser;
    });
  },

  login: async ({ password, email }) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    const tokenHash = hashRefreshToken(refreshToken);

    return transactionFunc(async (db) => {
      await refreshTokenRepository.createRefreshToken(
        {
          id: uuidv4(),
          userId: user.id,
          tokenHash,
          expiresAt: expiresAt(),
        },
        db
      );

      return { accessToken, refreshToken };
    });
  },

  getMe: async (userId) => {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("User");
    }

    return user;
  },

  logout: async (refreshToken) => {
    const tokenHash = hashRefreshToken(refreshToken);
    await refreshTokenRepository.revokeByHash(tokenHash, pool);
  },

  refresh: async (refreshToken) => {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashRefreshToken(refreshToken);

    const result = await transactionFunc(async (db) => {
      const valid = await refreshTokenRepository.findValidByHash(tokenHash, db);

      if (!valid) {
        const any = await refreshTokenRepository.findByHash(tokenHash, db);

        if (any?.revoked_at) {
          await refreshTokenRepository.revokeByAllForUser(any.user_id, db);
          return {
            revoked: true,
            userId: any.user_id
          }
        }

        throw new InvalidTokenError();
      }

      if (valid.user_id !== payload.sub) {
       await refreshTokenRepository.revokeByAllForUser(valid.user_id, db);
       return {
        mismatch: true,
        userId: valid.user_id
        }
      }

      await refreshTokenRepository.revokeById(valid.id, db);

      const user = await userRepository.findById(valid.user_id, db);

      if (!user) {
        throw new InvalidTokenError();
      }

      const newAccessToken = signAccessToken(user);
      const newRefreshToken = signRefreshToken(user);

      const newHash = hashRefreshToken(newRefreshToken);

      await refreshTokenRepository.createRefreshToken(
        {
          id: uuidv4(),
          userId: valid.user_id,
          tokenHash: newHash,
          expiresAt: expiresAt(),
        },
        db
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    });
    if(result.mismatch){
       logger.warn("Token mismatch detected", {userId: result.userId} )
      throw new InvalidTokenError("Refresh token mismatch detected")
    } else if (result.revoked){
      logger.warn("Token reuse detected", {userId: result.userId} )
      throw new TokenReuseDetectedError()
    }
    return result 
  },
};