import { NextPage } from "next";
import { Layout, ProfileHeader } from "~/Components/Components";

const ProfileVideos: NextPage = () => {
  return (
    <>
      <Layout>
        <>
          <ProfileHeader />
          <p>Hello world</p>
        </>
      </Layout>
    </>
  );
};

export default ProfileVideos;
