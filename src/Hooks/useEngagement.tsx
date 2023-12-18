import { EngagementType } from "@prisma/client";
import { useEffect, useState } from "react";

interface useEngagementButtonProps {
  EngagementData: {
    id: string | undefined;
    likes: number;
    dislikes: number;
  };
  viewer: {
    hasLiked: boolean | undefined;
    hasDisliked: boolean | undefined;
  };
  addLikeMutation: {
    mutate: (input: { id: string; userId: string }) => void;
  };
  addDislikeMutation: {
    mutate: (input: { id: string; userId: string }) => void;
  };
}
export function useEngagementButton({
  EngagementData,
  viewer,
  addLikeMutation,
  addDislikeMutation,
}: useEngagementButtonProps) {
  const [likeCount, setLikeCount] = useState(EngagementData.likes);
  const [dislikeCount, setDislikeCount] = useState(EngagementData.dislikes);
  const [userChoice, setUserChoice] = useState({
    like: viewer.hasLiked,
    dislike: viewer.hasDisliked,
  });
  useEffect(() => {
    setLikeCount(EngagementData.likes);
    setDislikeCount(EngagementData.dislikes);
    setUserChoice({
      like: viewer.hasLiked,
      dislike: viewer.hasDisliked,
    });
  }, [viewer]);
  const handleEngagement =
    (
      engagementType: EngagementType,
      mutateFunction: {
        mutate: (input: { id: string; userId: string }) => void;
      },
    ) =>
    (input: { id: string; userId: string }) => {
      const { like, dislike } = userChoice;
      const isLikeEngagement = engagementType === EngagementType.LIKE;
      if (isLikeEngagement) {
        if (like) {
          setLikeCount(likeCount - 1);
          setUserChoice({ like: false, dislike });
        } else {
          if (dislike) {
            setDislikeCount(dislikeCount - 1);
          }
          setLikeCount(likeCount + 1);
          setUserChoice({ like: true, dislike: false });
        }
      } else {
        if (dislike) {
          setDislikeCount(dislikeCount - 1);
          setUserChoice({ like, dislike: false });
        } else {
          if (like) {
            setLikeCount(likeCount - 1);
          }
          setDislikeCount(dislikeCount + 1);
          setUserChoice({ dislike: true, like: false });
        }
      }
      mutateFunction.mutate(input);
    };
  const handleLike = handleEngagement(EngagementType.LIKE, addLikeMutation);
  const handleDislike = handleEngagement(
    EngagementType.DISLIKE,
    addDislikeMutation,
  );
  return { likeCount, dislikeCount, userChoice, handleDislike, handleLike };
}
