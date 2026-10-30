"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function getDashboardData() {
  const user = await requireAuth();
  const isAdmin = user.role === "ADMIN";

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextWeekEnd = new Date(startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Run all independent queries concurrently with Promise.all
  const [
    activeCasesCount,
    nextWeekHearingsCount,
    upcomingHearings,
    paymentsThisMonth,
    remainingAgg,
    recentActivities,
  ] = await Promise.all([
    // 1. Active cases count
    prisma.case.count({
      where: {
        isDeleted: false,
        status: { isClosed: false },
      },
    }),

    // 2. Hearings next week count
    prisma.hearing.count({
      where: {
        hearingDate: {
          gte: startOfToday,
          lte: nextWeekEnd,
        },
        case: { isDeleted: false },
      },
    }),

    // 3. Upcoming hearings list (next 7 days)
    prisma.hearing.findMany({
      where: {
        hearingDate: {
          gte: startOfToday,
          lte: nextWeekEnd,
        },
        case: { isDeleted: false },
      },
      orderBy: { hearingDate: "asc" },
      take: 10,
      include: {
        case: {
          include: {
            client: true,
            lawyer: true,
            status: true,
          },
        },
      },
    }),

    // 4. Financial: Sum of payments this month (only queried if admin)
    isAdmin
      ? prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            paymentDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        })
      : Promise.resolve(null),

    // 5. Financial: Sum of remaining fees owed across active cases (only if admin)
    isAdmin
      ? prisma.case.aggregate({
          _sum: { remainingAmount: true },
          where: {
            isDeleted: false,
            status: { isClosed: false },
          },
        })
      : Promise.resolve(null),

    // 6. Recent activity logs
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const thisMonthRevenue = paymentsThisMonth?._sum.amount || 0;
  const remainingFeesOwed = remainingAgg?._sum.remainingAmount || 0;

  return {
    isAdmin,
    activeCasesCount,
    nextWeekHearingsCount,
    thisMonthRevenue: isAdmin ? thisMonthRevenue : null,
    remainingFeesOwed: isAdmin ? remainingFeesOwed : null,
    upcomingHearings,
    recentActivities,
  };
}

