export class SSESerializerTransform extends TransformStream<any, Uint8Array> {
    constructor() {
        super({
            transform: (chunk: any, controller) => {
                let data = '';
                if (chunk.id) {
                    data += `id: ${chunk.id}\n`;
                }
                if (chunk.event) {
                    data += `event: ${chunk.event}\n`;
                }
                if (chunk.retry) {
                    data += `retry: ${chunk.retry}\n`;
                }
                if (chunk.data) {
                    data += `data: ${JSON.stringify(chunk.data)}\n`;
                }
                data += '\n';

                const encoder = new TextEncoder();
                controller.enqueue(encoder.encode(data));
            }
        });
    }
}
