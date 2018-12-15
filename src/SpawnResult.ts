import { SpawnOutput } from "./types";

export default class SpawnResult {
  constructor(
    public readonly command: string,
    public readonly args: ReadonlyArray<string>,
    public readonly code: number,
    private readonly outputs: ReadonlyArray<SpawnOutput>
  ) {}

  get output() {
    return this.bufferToString();
  }

  get stderr() {
    return this.bufferToString(false);
  }

  get stdout() {
    return this.bufferToString(true);
  }

  public writeTo(
    stdout: NodeJS.WritableStream | null = null,
    stderr: NodeJS.WritableStream | null = null
  ) {
    const out = stdout || process.stdout;
    const err = stderr || process.stderr;

    this.outputs.forEach(output => {
      if (output[0]) {
        out.write(output[1]);
      } else {
        err.write(output[1]);
      }
    });
  }

  private bufferToString(bool?: boolean) {
    const outputs =
      bool == null
        ? this.outputs.map(o => o[1].toString("utf8"))
        : this.outputs.map(o => (o[0] === bool ? o[1].toString("utf8") : ""));

    return outputs.join("").replace(/[\0\r\n]+$/, "");
  }
}
