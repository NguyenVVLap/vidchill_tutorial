import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Button from "~/Components/Buttons/Button";
import { MultiColumnPlaylist } from "~/Components/Components";
import { LoadingMessage, ErrorMessage } from "~/Components/ErrorMessage";
import Plus from "~/Components/Icons/Plus";
import Layout from "~/Components/Layout";
import ProfileHeader from "~/Components/ProfileHeader";
import { playlistRouter } from "~/server/api/routers/playlist";
import { api } from "~/utils/api";

const ProfilePlaylists: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { data: sessionData } = useSession();

  const { data, isLoading, error } = api.playlist.getPlaylistByUserId.useQuery(
    userId as string,
  );

  const errorTypes = !data ?? data?.length === 0 ?? error;
  const Error = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (userId == sessionData?.user.id && errorTypes) {
      return (
        <>
          <ErrorMessage
            message="No Playlists Created"
            description="You have not yet created a playlist inside your library."
          />
        </>
      );
    } else if (errorTypes) {
      <ErrorMessage
        message="No libraries created"
        description="Profile has not yet created a playlist."
      />;
    } else {
      return <></>;
    }
  };
  return (
    <>
      <Layout>
        <>
          <ProfileHeader />
          {errorTypes ? (
            <Error />
          ) : (
            <MultiColumnPlaylist
              playlists={
                data
                  ? data.map((playlist) => ({
                      id: playlist.id,
                      title: playlist.title,
                      description: playlist.description ?? "",
                      videoCount: playlist.videoCount,
                      playlistThumbnail: playlist?.playlistThumbnail ?? "",
                      createdAt: playlist.createdAt,
                    }))
                  : []
              }
            />
          )}
        </>
      </Layout>
    </>
  );
};

export default ProfilePlaylists;
