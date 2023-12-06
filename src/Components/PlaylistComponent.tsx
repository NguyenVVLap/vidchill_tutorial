export function MultiColumnPlaylist({
  playlists,
}: {
  playlists: {
    id: string;
    title: string;
    videoCount: number;
    playlistThumbnail: string;
    createdAt: Date;
  }[];
}) {
  return (
    <>
      <p>Multi Column Playlist</p>
    </>
  );
}

export function SinglePlaylist({
  playlist,
  children,
}: {
  playlist: {
    id: string;
    title: string;
    videoCount: number;
    playlistThumbnail: string;
    createdAt: Date;
  };
  children?: React.ReactNode;
}) {
  return (
    <>
      <p>Single Playlist</p>
    </>
  );
}
