import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { PublishedButton } from "~/Components/Buttons/Buttons";
import { Layout, Thumbnail } from "~/Components/Components";
import { LoadingMessage, ErrorMessage } from "~/Components/ErrorMessage";
import { GreenEye, GreenHeart, GreenUserCheck } from "~/Components/Icons/Icons";
import { api } from "~/utils/api";

interface StatsItem {
  name: string;
  stat: string;
  icon: (className: string) => JSX.Element;
}

const Dashboard: NextPage = () => {
  const { data: sessionData } = useSession();
  const userId = sessionData?.user.id;
  console.log(sessionData);

  const { data, isLoading, error, refetch } =
    api.user.getDashboardData.useQuery(userId ?? "");
  const Error = () => {
    if (isLoading) {
      return <LoadingMessage />;
    } else if (error ?? !data) {
      return (
        <ErrorMessage
          icon="GreenPlay"
          message="Error loading channel"
          description="Sorry there is an error at this time."
        />
      );
    } else {
      return <></>;
    }
  };

  const stats: StatsItem[] = [
    {
      name: "Total Views",
      stat: data?.totalViews?.toString() ?? "0",
      icon: (className) => <GreenEye className={className} />,
    },
    {
      name: "Total followers",
      stat: data?.totalFollowers?.toString() ?? "0",
      icon: (className) => <GreenUserCheck className={className} />,
    },
    {
      name: "Total likes",
      stat: data?.totalLikes?.toString() ?? "0",
      icon: (className) => <GreenHeart className={className} />,
    },
  ];

  return (
    <>
      <Head>
        <title>Creator Studio - VidChill</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout closeSidebar={true}>
        <>
          {!data ?? error ? (
            <Error />
          ) : (
            <div className="flex flex-col gap-8 bg-white pt-3 shadow sm:rounded-lg">
              <div className="md:flex md:items-center md:justify-between md:space-x-5">
                <div className=" pt-1.5">
                  <h1 className="text-2xl font-bold text-gray-900">
                    <span>Welcome Back</span> {sessionData?.user.name}
                  </h1>
                  <p className="text-sm font-medium text-gray-500">
                    Track and manage your channel and videos
                  </p>
                </div>
                {/* Upload button here */}
              </div>
              <dl className="mt-5 grid grid-cols-1 divide-y divide-gray-200 overflow-hidden rounded-2xl border border-gray-200 shadow-sm md:grid-cols-3 md:divide-x md:divide-y-0">
                {stats.map((item) => (
                  <div className="px-4 py-5 sm:p-6" key={item.name}>
                    {item.icon("h-4 w-4 ")}
                    <dt className="text-base font-normal text-gray-900">
                      {item.name}
                    </dt>
                    <dd className="mm:block mt-1 text-3xl font-semibold text-primary-600 lg:flex">
                      {item.stat}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          <div className="rounded-2xl border border-gray-200 p-6 px-4 shadow-sm sm:px-6 lg:px-8">
            <div className="mt-8 flow-root">
              <div className="lg:-mx=8 -mx-4 -my-2 overflow-x-auto sm:-mx-6">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                        >
                          Uploaded
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                        >
                          Rating
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                        >
                          Data uploaded
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                        >
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {data?.videos.map((video) => (
                        //Publish button here
                        <tr key={video.id}>
                          <PublishedButton
                            video={{ id: video.id, published: video.publish }}
                          />
                          <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                            <div className="flex">
                              <div className="h-16 w-16 flex-shrink-0">
                                <Thumbnail
                                  thumbnailUrl={video.thumbnailUrl ?? ""}
                                />
                              </div>
                              <div className="ml-4 font-medium text-gray-900">
                                {video.title}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
                            <span className="inline-flex items-center rounded-full bg-success-100 px-2 py-1 text-xs font-medium text-success-700">
                              {video.likes} Likes
                            </span>
                            <span className="inline-flex items-center rounded-full bg-error-100 px-2 py-1 text-xs font-medium text-error-700">
                              {video.dislikes} Dislikes
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-600">
                            {video.createdAt.toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      </Layout>
    </>
  );
};
export default Dashboard;
