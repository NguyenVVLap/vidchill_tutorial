import { NextPage } from "next";
import Head from "next/head";
import { Layout, MuliColumnVideo } from "~/Components/Components";
import { ErrorMessage, LoadingMessage } from "~/Components/ErrorMessage";
import { api } from "~/utils/api";

export const Home: NextPage = () => {
  const { data, isLoading, error } = api.video.getRandomVideos.useQuery(20);
  const Error = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (error ?? !data) {
      return (
        <ErrorMessage
          icon="GreenPlay"
          message="No Videos"
          description="Sorry there is no videos at this time."
        />
      );
    } else {
      return <></>;
    }
  };
  return (
    <>
      <Head>
        <title>VidChill</title>
        <meta
          name="description"
          content="Enjoy the videos and music you love, upload original content, and share it all with friends, family, and the world on VidChill."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout closeSidebar={false}>
        {!data ?? error ? (
          <Error />
        ) : (
          <>
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
              users={data?.user.map((user) => ({
                name: user?.name ?? "",
                image: user?.image ?? "",
              }))}
            />
          </>
        )}
      </Layout>
    </>
  );
};
