import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { LoadingMessage, ErrorMessage } from "~/Components/ErrorMessage";
import Layout from "~/Components/Layout";
import { PlaylistPage } from "~/Components/PlaylistComponent";
import { api } from "~/utils/api";

const LikedVideos: NextPage = () => {
  const { data: sessionData } = useSession();
  const QueryTitle = "Liked Videos" as string;
  const { data, isLoading, error } = api.playlist.getPlaylistByTitle.useQuery({
    title: QueryTitle,
    userId: sessionData?.user.id ?? "",
  });
  const Error = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (error ?? !data) {
      return (
        <ErrorMessage
          icon="GreenPlay"
          message="No Current History"
          description="Watching some videos in order to add to history."
        />
      );
    } else {
      return <></>;
    }
  };
  const playlist = data?.playlist;
  return (
    <>
      <Layout>
        {!playlist ? (
          <Error />
        ) : (
          <PlaylistPage
            playlist={{
              id: data.playlist?.id ?? "",
              title: data.playlist?.title ?? "",
              description: data.playlist?.description ?? "",
              videoCount: data.videos.length ?? 0,
              playlistThumbnail: data.videos[0]?.thumbnailUrl ?? "",
              createdAt: data.playlist?.createdAt ?? new Date(),
            }}
            videos={data.videos.map((video) => ({
              id: video?.id ?? "",
              title: video?.title ?? "",
              thumbnailUrl: video?.thumbnailUrl ?? "",
              createdAt: video?.createdAt ?? new Date(),
              views: video?.views ?? 0,
            }))}
            authors={data.authors.map((author) => ({
              id: author?.id ?? "",
              name: author?.name ?? "",
              image: author?.image ?? "",
            }))}
            user={{
              id: data.user?.id ?? "",
              image: data.user?.image ?? "",
              name: data.user?.name ?? "",
              followers: data.user?.followers ?? 0,
            }}
          />
        )}
      </Layout>
    </>
  );
};

export default LikedVideos;
