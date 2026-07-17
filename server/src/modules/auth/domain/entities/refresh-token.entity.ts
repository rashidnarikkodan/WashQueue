export class RefreshToken {
  public readonly token: string

  constructor(token: string) {
    this.token = token
  }

  async verify(
    rawToken: string,
    hashService: { verify: (hashed: string, raw: string) => Promise<boolean> }
  ): Promise<boolean> {
    return hashService.verify(this.token, rawToken)
  }
}
