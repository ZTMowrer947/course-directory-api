interface TestCaseBase<T> {
  name: string;
  expectedResult: string;
  status: number;
  input: T;
}

export type TestCase<T, E extends object> = TestCaseBase<T> &
  (
    | {
        ok: true;
      }
    | {
        ok: false;
        errorExpectation: E;
      }
  );

interface ValidationExpectation<T extends object> {
  invalidFields: (keyof T)[];
  getExpectedMessages(key: keyof T): string[];
}

export type ValidationTestCase<T extends object> = TestCase<
  T,
  ValidationExpectation<T>
>;
