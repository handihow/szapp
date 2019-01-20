import { Color } from '../shared/color.model';
import { User } from '../auth/user.model';
import { Evaluation } from '../evaluations/evaluation.model';
import { Skill } from '../skills/skill.model';
import { Project } from '../projects/project.model';

export interface Result {
  color: Color;
  evaluation: Evaluation;
  student: User;
  skill: Skill;
  project: Project;
  teacher: User;
}