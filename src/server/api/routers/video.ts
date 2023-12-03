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

export const videoRouter = createTRPCRouter({
  getVideoById: publicProcedure
    .input(
      z.object({
        id: z.string(),
        viewerId: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rawVideo = await ctx.db.video.findUnique({
        where: {
          id: input.id,
        },
        include: {
          user: true,
          comments: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!rawVideo) {
        throw new Error("Video not found");
      }
      const { user, comments, ...video } = rawVideo;
      const followers = await ctx.db.followEngagement.count({
        where: {
          followerId: video.userId,
        },
      });
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
      const userWithFollowers = { ...user, followers };
      const videoWithLikesDislikesViews = { ...video, likes, dislikes, views };
      const commentsWithUsers = comments.map(({ user, ...comment }) => ({
        user,
        comment,
      }));
      let viewerHasFollowed = false;
      let viewerHasLiked = false;
      let viewerHasDisliked = false;
      if (input.viewerId && input.viewerId !== "") {
        viewerHasLiked = !!(await ctx.db.videoEngagement.findFirst({
          where: {
            videoId: input.id,
            userId: input.viewerId,
            engagementType: EngagementType.LIKE,
          },
        }));
        viewerHasDisliked = !!(await ctx.db.videoEngagement.findFirst({
          where: {
            videoId: input.id,
            userId: input.viewerId,
            engagementType: EngagementType.DISLIKE,
          },
        }));
        viewerHasFollowed = !!(await ctx.db.followEngagement.findFirst({
          where: {
            followingId: rawVideo.userId,
            followerId: input.viewerId,
          },
        }));
      } else {
        viewerHasFollowed = false;
        viewerHasLiked = false;
        viewerHasDisliked = false;
      }
      const viewer = {
        hasFollowed: viewerHasFollowed,
        hasLiked: viewerHasLiked,
        hasDisliked: viewerHasDisliked,
      };
      return {
        video: videoWithLikesDislikesViews,
        user: userWithFollowers,
        comments: commentsWithUsers,
        viewer,
      };
    }),
  getRandomVideos: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      // @ts-ignore
      const videosWithUser = await ctx.db.video.findMany({
        where: {
          publish: true,
        },
        include: {
          user: true,
        },
      });
      // @ts-ignore
      const videos = videosWithUser.map(({ user, ...video }) => video);
      // @ts-ignore
      const users = videosWithUser.map(({ user }) => user);
      const videosWithCounts = await Promise.all(
        // @ts-ignore
        videos.map(async (video) => {
          // @ts-ignore
          const views = await ctx.db.videoEngagement.count({
            where: {
              videoId: video.id,
              engagementType: EngagementType.VIEW,
            },
          });
          return {
            ...video,
            views,
          };
        }),
      );
      const indices = Array.from(
        { length: videosWithCounts.length },
        (_, i) => i,
      );
      for (let i = indices.length - 1; i >= 0; i--) {
        if (indices[i] !== undefined) {
          const j = Math.floor(Math.random() * (i + 1));
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
      }
      const shuffledVideosWithCounts = indices.map((i) => videosWithCounts[i]);
      const shuffledUsers = indices.map((i) => users[i]);

      const randomVideos = shuffledVideosWithCounts.slice(0, input);
      const randomUsers = shuffledUsers.slice(0, input);

      return { videos: randomVideos, user: randomUsers };
    }),
  getVideosBySearch: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      // @ts-ignore
      const videosWithUser = await ctx.db.video.findMany({
        where: {
          publish: true,
          title: {
            contains: input,
            mode: "insensitive",
          },
        },
        take: 10,
        include: {
          user: true,
        },
      });
      // @ts-ignore
      const videos = videosWithUser.map(({ user, ...video }) => video);
      // @ts-ignore
      const users = videosWithUser.map(({ user }) => user);
      const videosWithCounts = await Promise.all(
        // @ts-ignore
        videos.map(async (video) => {
          // @ts-ignore
          const views = await ctx.db.videoEngagement.count({
            where: {
              videoId: video.id,
              engagementType: EngagementType.VIEW,
            },
          });
          return {
            ...video,
            views,
          };
        }),
      );
      return { videos: videosWithCounts, user: users };
    }),
  addVideoToPlaylist: protectedProcedure
    .input(
      z.object({
        playlistId: z.string(),
        videoId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const playlistAldreadyHasVideo = await ctx.db.playlistHasVideo.findMany({
        where: {
          playlistId: input.playlistId,
          videoId: input.videoId,
        },
      });
      if (playlistAldreadyHasVideo.length > 0) {
        const deleteVideo = await ctx.db.playlistHasVideo.deleteMany({
          where: {
            playlistId: input.playlistId,
            videoId: input.videoId,
          },
        });
        return deleteVideo;
      } else {
        const playlistHasVideo = await ctx.db.playlistHasVideo.create({
          data: {
            playlistId: input.playlistId,
            videoId: input.videoId,
          },
        });
        return playlistHasVideo;
      }
    }),
});
