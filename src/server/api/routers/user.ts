/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable */

import { EngagementType } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getChannelById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        viewerId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: input.id,
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      const followers = await ctx.db.followEngagement.count({
        where: {
          followingId: user.id,
        },
      });
      const followings = await ctx.db.followEngagement.count({
        where: {
          followerId: user.id,
        },
      });
      let viewerHasFollowed = false;
      const userWithEngagements = { ...user, followers, followings };
      if (input.viewerId && input.viewerId !== "") {
        viewerHasFollowed = !!(await ctx.db.followEngagement.findFirst({
          where: {
            followingId: user.id,
            followerId: input.viewerId,
          },
        }));
      }
      const viewer = {
        hasFollowed: viewerHasFollowed,
      };
      return { user: userWithEngagements, viewer };
    }),

  addFollow: protectedProcedure
    .input(z.object({ followerId: z.string(), followingId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existingFollow = await ctx.db.followEngagement.findMany({
        where: {
          followingId: input.followingId,
          followerId: input.followerId,
          engagementType: EngagementType.FOLLOW,
        },
      });
      if (existingFollow.length > 0) {
        const deleteFollow = await ctx.db.followEngagement.deleteMany({
          where: {
            followingId: input.followingId,
            followerId: input.followerId,
            engagementType: EngagementType.FOLLOW,
          },
        });
        return deleteFollow;
      } else {
        const follow = await ctx.db.followEngagement.create({
          data: {
            followingId: input.followingId,
            followerId: input.followerId,
            engagementType: EngagementType.FOLLOW,
          },
        });
        return follow;
      }
    }),
  getUserFollowing: publicProcedure
    .input(
      z.object({
        id: z.string(),
        viewerId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: input.id,
        },
        include: {
          followings: {
            include: {
              following: {
                include: {
                  followings: true,
                },
              },
            },
          },
        },
      });
      if (!user) {
        return null;
      }
      const followings = user.followings;
      const followingsWitViewerFollowedStatus = await Promise.all(
        followings.map(async (following) => {
          let viewerHasFollowed = false;
          if (input.viewerId && input.viewerId !== "") {
            viewerHasFollowed = !!(await ctx.db.followEngagement.findFirst({
              where: {
                followingId: following.following.id,
                followerId: input.viewerId,
              },
            }));
          }
          return { ...following, viewerHasFollowed };
        }),
      );
      return { ...user, followings: followingsWitViewerFollowedStatus };
    }),
  getDashboardData: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          id: input,
        },
        include: {
          videos: true,
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      const videosWithCounts = await Promise.all(
        user.videos.map(async (video) => {
          const likes = await ctx.db.videoEngagement.count({
            where: {
              videoId: video.id,
              engagementType: EngagementType.LIKE,
            },
          });
          const dislikes = await ctx.db.videoEngagement.count({
            where: {
              videoId: video.id,
              engagementType: EngagementType.DISLIKE,
            },
          });
          const views = await ctx.db.videoEngagement.count({
            where: {
              videoId: video.id,
              engagementType: EngagementType.VIEW,
            },
          });
          return {
            ...video,
            likes,
            dislikes,
            views,
          };
        }),
      );
      const totalLikes = videosWithCounts.reduce(
        (total, video) => total + video.likes,
        0,
      );
      const totalViews = videosWithCounts.reduce(
        (total, video) => total + video.views,
        0,
      );
      const totalFollowers = await ctx.db.followEngagement.count({
        where: {
          followingId: user.id,
        },
      });
      return {
        user,
        totalFollowers,
        videos: videosWithCounts,
        totalViews,
        totalLikes,
      };
    }),
});
