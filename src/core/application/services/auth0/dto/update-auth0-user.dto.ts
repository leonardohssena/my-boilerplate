export class UpdateAuth0UserDto {
  name: string
  user_metadata?: { [key: string]: unknown }

  constructor(partial: Partial<UpdateAuth0UserDto> = {}) {
    Object.assign(this, partial)
  }
}
