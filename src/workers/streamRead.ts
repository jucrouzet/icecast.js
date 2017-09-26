import {IFetchResponseHeaders} from '../StreamData';

/**
 * fetch() operations WebWorker
 */
((): void => {

  const error: Function = (reason: string): void => {
    postMessage({type: 'error', error: reason});
  };

  /**
   * Stream reader.
   */
  const streamReader: (h: IFetchResponseHeaders, i: ReadableStreamReader) => Promise<null> =
    async (headers: IFetchResponseHeaders, input: ReadableStreamReader): Promise<null> => {
      return input.read()
        .then((val: IteratorResult<ArrayBufferView>) => {
          if ((val.value !== undefined) && (val.value.buffer instanceof ArrayBuffer)) {
            const copy: Uint8Array = new Uint8Array(val.value.buffer.byteLength);

            copy.set(new Uint8Array(val.value.buffer));
            postMessage(
              {
                type : 'data',
                data: copy.buffer,
              },
              [copy.buffer],
            );
          }
          if (val.done) {
            postMessage({type: 'end'});
            return null;
          }
          return streamReader(headers, input);
        })
        .catch(async (err: Error) => {
          error(err.message);
          return input
            .cancel()
            .then(() => null)
            .catch(() => null);
        });
    };

  /**
   * On message received.
   */
  addEventListener('message', (event: MessageEvent): void => {
    if (event.data.type === 'start') {
      self.fetch(
        event.data.url,
        {
          method: 'GET',
          mode  : 'cors',
        },
        )
        .then(async (r: Response): Promise<null> => {
          const headers: IFetchResponseHeaders = {};

          for (const [n, v] of Array.from(r.headers.entries())) {
            headers[n] = v;
          }
          postMessage(
            {
              type: 'headers',
              headers,
            },
          );

          if (r.body === null) {
            throw new Error('Body is null');
          }
          return streamReader(headers, r.body.getReader());
        })
        .catch((err: Error) => {
          error(err.message);
        });
    }
  });
})();
