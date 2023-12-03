import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { Layout, SingleColumnVideo } from "~/Components/Components";
import { ErrorMessage, LoadingMessage } from "~/Components/ErrorMessage";

import { api } from "~/utils/api";

const SearchPage: NextPage = () => {
  const router = useRouter();
  const searchQuery = router.query.q;
  const { data, isLoading, error } = api.video.getVideosBySearch.useQuery(
    searchQuery as string,
  );
  console.log(data);

  const Error = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (error ?? !data) {
      return (
        <ErrorMessage
          icon="GreenPlay"
          message="No Videos"
          description="Sorry try another search result."
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
            <SingleColumnVideo
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              videos={data?.videos.map((video) => ({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                id: video?.id ?? "",
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                title: video?.title ?? "",
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                thumbnailUrl: video?.thumbnailUrl ?? "",
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                createdAt: video?.createdAt ?? new Date(),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                views: video?.views ?? 0,
              }))}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/ban-ts-comment
              // @ts-ignore
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              users={data?.user.map((user) => ({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                name: user?.name ?? "",
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                image: user?.image ?? "",
              }))}
            />
          </>
        )}
      </Layout>
    </>
  );
};

export default SearchPage;
