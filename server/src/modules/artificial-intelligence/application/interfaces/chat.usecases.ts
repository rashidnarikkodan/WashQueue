import { ChatRequestDto, ChatResponseDto, ChatUserContext } from "../dto/chat.dto"

export interface IChatUseCase {
  execute(dto: ChatRequestDto, userContext?: ChatUserContext): Promise<ChatResponseDto>
}

export interface IAskKnowledgeUseCase {
  execute(prompt: string): Promise<string>
}
