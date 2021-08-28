import * as yup from 'yup';

const CourseSchema = yup.object({
  title: yup.string().defined().required(),
  description: yup.string().defined().required(),
  estimatedTime: yup.string().nullable().notRequired(),
  materialsNeeded: yup.string().nullable().notRequired(),
});

export type CourseInput = yup.Asserts<typeof CourseSchema>;

export default CourseSchema;
