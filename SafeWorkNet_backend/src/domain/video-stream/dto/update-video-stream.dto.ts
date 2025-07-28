import { CommonVideoStreamDto, SectionDto } from './common-video-stream.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateVideoStreamDto extends PartialType(CommonVideoStreamDto) {
  screenSections?: SectionDto[];
}
