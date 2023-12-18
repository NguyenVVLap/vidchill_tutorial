import { Switch } from "@headlessui/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { api } from "~/utils/api";

interface PublishedButtonProps {
  video: {
    id: string;
    published: boolean;
  };
}

export default function PublishedButton({ video }: PublishedButtonProps) {
  const { data: sessionData } = useSession();
  const [userChoice, setUserChoice] = useState({
    publish: video.published,
  });
  const publishVideoMutation = api.video.publishVideo.useMutation();
  const handlePublishVideo = (input: { id: string; userId: string }) => {
    if (userChoice.publish) {
      setUserChoice({ publish: false });
    } else {
      setUserChoice({ publish: true });
    }
    publishVideoMutation.mutate(input);
  };
  const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(" ");
  };
  return (
    <>
      <td className="whitesspace-nowrap px-3 py-5 text-sm text-gray-500">
        <Switch
          checked={userChoice.publish}
          onChange={() =>
            handlePublishVideo({
              id: video.id,
              userId: sessionData ? sessionData.user.id : "",
            })
          }
          className={classNames(
            userChoice.publish ? "bg-primary-600" : "bg-gray-200",
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2",
          )}
        >
          <span
            className={classNames(
              userChoice.publish ? "translate-x-5" : "translate-x-0",
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
            )}
          ></span>
        </Switch>
      </td>
      <td className="whitespace-nowrap px-3 py-5 text-sm text-gray-500">
        {userChoice.publish ? (
          <span className="inline-flex items-center rounded-full border border-success-700 px-2 py-1 text-xs font-medium text-success-700">
            Publish
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full border border-warning-700 px-2 py-1 text-xs font-medium text-warning-700">
            Unpublish
          </span>
        )}
      </td>
    </>
  );
}
