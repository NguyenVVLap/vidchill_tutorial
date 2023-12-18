import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "~/Components/Buttons/Buttons";
import {
  Layout,
  MuliColumnVideo,
  ProfileHeader,
} from "~/Components/Components";
import { LoadingMessage, ErrorMessage } from "~/Components/ErrorMessage";
import { Plus } from "~/Components/Icons/Icons";
import { api } from "~/utils/api";

const ProfileVideos: NextPage = () => {
  const router = useRouter();
  const { userId } = router.query;
  const { data: sessionData } = useSession();

  const { data, isLoading, error } = api.video.getVideosByUserId.useQuery(
    userId as string,
  );

  const errorTypes = !data ?? data?.videos?.length === 0 ?? error;
  
  const Error = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (userId == sessionData?.user.id && errorTypes) {
      return (
        <>
          <ErrorMessage
            icon="GreenPlay"
            message="No Videos Uploaded"
            description="Click to upload new video. You have yet to upload a video."
          >
            <Button
              variant="primary"
              size="2xl"
              href="/profile/edit"
              className="ml-4 flex"
            >
              <Plus className="mr-2 h-5 w-5 shrink-0 stroke-white" />
              New Video
            </Button>
          </ErrorMessage>
        </>
      );
    } else if (errorTypes) {
      <ErrorMessage
        icon="GreenPlay"
        message="No videos available"
        description="Profile has no videos uploaded."
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
            <MuliColumnVideo
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              videos={data?.videos.map((video) => ({
                id: video?.id ?? "",
                title: video?.title ?? "",
                thumbnailUrl: video?.thumbnailUrl ?? "",
                createdAt: video?.createdAt ?? new Date(),
                views: video?.views ?? 0,
              }))}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              users={data?.users.map((user) => ({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                name: user?.name ?? "",
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                image: user?.image ?? "",
              }))}
            />
          )}
        </>
      </Layout>
    </>
  );
};

export default ProfileVideos;
