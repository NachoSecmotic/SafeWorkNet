import { CommonVideoStreamDto, SectionDto } from './common-video-stream.dto';

export class CreateVideoStreamDto extends CommonVideoStreamDto {
  screenSections?: SectionDto[];
}
