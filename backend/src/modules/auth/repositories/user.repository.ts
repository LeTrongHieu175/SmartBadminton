import { Prisma, RefreshToken, User } from '@prisma/client';
import prisma from '../../../shared/prisma';

export const findUserByUsername = (username: string) =>
  prisma.user.findUnique({ where: { username } });

export const findUserByPhone = (phone: string) =>
  prisma.user.findUnique({ where: { phone } });

export const findUserByEmail = (email: string) =>
  prisma.user.findUnique({ where: { email } });

type TransactionInputs = {
  user: Prisma.UserCreateInput;
  refreshToken: Omit<Prisma.RefreshTokenUncheckedCreateInput, 'userId'>;
  audit: Omit<Prisma.LoginAuditUncheckedCreateInput, 'userId'>;
};

export const createUserWithRelations = async ({
  user,
  refreshToken,
  audit,
}: TransactionInputs): Promise<{
  user: User;
  refreshToken: RefreshToken;
}> =>
  prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({ data: user });
    const token = await tx.refreshToken.create({
      data: {
        ...refreshToken,
        userId: newUser.id,
      },
    });
    await tx.loginAudit.create({
      data: {
        ...audit,
        userId: newUser.id,
      },
    });

    return { user: newUser, refreshToken: token };
  });

export const createLoginAudit = (data: Prisma.LoginAuditCreateInput) =>
  prisma.loginAudit.create({ data });

export const createRefreshToken = (
  data: Prisma.RefreshTokenUncheckedCreateInput,
) => prisma.refreshToken.create({ data });
