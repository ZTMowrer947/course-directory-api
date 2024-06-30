import { validate as validateEmail } from 'email-validator-rfc-5322';
import {
  type Infer,
  nonempty,
  object,
  refine,
  size,
  string,
} from 'superstruct';

const Email = refine(
  nonempty(string()),
  'email',
  (value) => validateEmail(value) || 'input value must be a valid email'
);

export const UserInput = object({
  firstName: nonempty(string()),
  lastName: nonempty(string()),
  emailAddress: Email,
  password: size(string(), 8, Infinity),
});

export type UserInputData = Infer<typeof UserInput>;
