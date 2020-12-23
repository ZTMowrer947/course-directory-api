// Imports
import type { EntityId } from '../../entities/base';
import User from '../../entities/user.entity';
import { IUserRepository } from '../user';

// Mock class
const createUserRepositoryMock = jest.fn(
  (): IUserRepository => {
    // Declare variables to store user data
    let users: User[] = [];

    return {
      findAll: jest
        .fn()
        .mockRejectedValue(new Error('Method not implemented.')),
      findById: jest.fn(
        (id: EntityId) => users.find((user) => user.id === id) ?? null
      ),
      create: jest.fn((userData: User) => {
        const greatestCurrentId = users.reduce(
          (current, user) => (user.id > current ? user.id : current),
          0
        );
        const nextId = greatestCurrentId + 1;

        const user = userData;
        user.id = nextId;
        user.version = 1;

        users = [...users, user];

        return nextId;
      }),
      update: jest.fn((id: EntityId, updateData: User) => {
        const indexToUpdate = users.findIndex((user) => user.id === id);

        const updatedUser = updateData;
        updatedUser.id = id;
        updatedUser.version = users[indexToUpdate].version + 1;

        users = [
          ...users.slice(0, indexToUpdate),
          updatedUser,
          ...users.slice(indexToUpdate + 1),
        ];
      }),
      delete: jest.fn((user: User) => {
        const indexToDelete = users.findIndex(
          (currentUser) => currentUser.id === user.id
        );

        if (indexToDelete !== -1) {
          users = [
            ...users.slice(0, indexToDelete),
            ...users.slice(indexToDelete + 1),
          ];
        }
      }),
      verifyCredentials: jest.fn((emailAddress: string, password: string) => {
        const user = users.find(
          (currentUser) => currentUser.emailAddress === emailAddress
        );

        return !!user && user.password === password;
      }),
    };
  }
);

// Exports
export default createUserRepositoryMock;
