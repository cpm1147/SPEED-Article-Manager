/* eslint-disable prettier/prettier */
export class CreateArticleDto {
  title: string;
  authors: string[];
  source?: string;
  publication_year: number;
  doi: string;
  abstract?: string;
  linked_discussion?: string;
  practice?: string;
  claim?: string;
  result?: string;
  participant_type?: string;
  method?: string;
  isModerated?: boolean;
}
