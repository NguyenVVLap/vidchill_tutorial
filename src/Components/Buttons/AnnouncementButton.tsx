import { useSession } from "next-auth/react";
import { useEngagementButton } from "~/Hooks/useEngagement";
import { api } from "~/utils/api";
import { ThumbsDown, ThumbsUp } from "../Icons/Icons";

interface AnnouncementButtonProps {
  EngagementData: {
    id: string | undefined;
    likes: number;
    dislikes: number;
  };
  viewer: {
    hasLiked: boolean | undefined;
    hasDisliked: boolean | undefined;
  };
}

export default function AnnouncementButton({
  EngagementData,
  viewer,
}: AnnouncementButtonProps) {
  const { likeCount, dislikeCount, userChoice, handleDislike, handleLike } =
    useEngagementButton({
      EngagementData,
      viewer,
      addLikeMutation: api.announcement.addLikeAnnouncement.useMutation(),
      addDislikeMutation: api.announcement.addDislikeAnnouncement.useMutation(),
    });
  const { data: sessionData } = useSession();

  function signIn(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex-end isolate inline-flex rounded-md shadow-sm">
      <button
        type="button"
        onClick={
          sessionData
            ? () =>
                handleLike({
                  id: EngagementData ? EngagementData.id + "" : "",
                  userId: sessionData ? sessionData.user.id : "",
                })
            : () => signIn()
        }
        className={`focus r text-regular group relative inline-flex items-center rounded-l-md  px-2  py-2  focus:z-10
        ${
          userChoice.like
            ? "group text-primary-600 hover:text-gray-900 group-hover:stroke-gray-900 "
            : "group bg-white text-gray-600  hover:text-primary-600 group-hover:stroke-primary-600"
        }`}
      >
        <ThumbsUp
          className={`group h-5 w-5 shrink-0 
            ${
              userChoice.like
                ? "group fill-primary-600 stroke-primary-600 group-hover:stroke-gray-900"
                : "group stroke-gray-600 group-hover:stroke-primary-600"
            }
        `}
        />
        <p className="pl-2">{likeCount}</p>
      </button>
      <button
        type="button"
        onClick={
          sessionData
            ? () =>
                handleDislike({
                  id: EngagementData ? EngagementData.id + "" : "",
                  userId: sessionData ? sessionData.user.id : "",
                })
            : () => signIn()
        }
        className={`focus r text-regular group relative inline-flex items-center rounded-l-md  px-2  py-2  focus:z-10
        ${
          userChoice.dislike
            ? "group text-error-600 hover:text-gray-900 group-hover:stroke-gray-900 "
            : "group bg-white text-gray-600  hover:text-error-600 group-hover:stroke-error-600"
        }`}
      >
        <ThumbsDown
          className={`group h-5 w-5 shrink-0 
            ${
              userChoice.dislike
                ? "group fill-error-600 stroke-error-600 group-hover:stroke-gray-900"
                : "group stroke-gray-600 group-hover:stroke-error-600"
            }
        `}
        />
        <p className="pl-2">{dislikeCount}</p>
      </button>
    </div>
  );
}
