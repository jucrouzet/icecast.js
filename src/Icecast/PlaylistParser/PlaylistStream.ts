/**
 * Stream datas.
 */
export interface IPlaylistStream {
  streamUrl: string;
  score?: number;
  title?: string;
  description?: string;
  duration?: number;
  metas?: {};
  mimeType?: string;
  bitrate?: number;
}
