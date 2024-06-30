import * as yup from 'yup';

const UserSchema = yup.object().shape({
  firstName: yup.string().defined().required(),
  lastName: yup.string().defined().required(),
  emailAddress: yup.string().email().defined().required(),
  password: yup.string().min(8).defined().required(),
});

export type UserInput = yup.Asserts<typeof UserSchema>;

export default UserSchema;
