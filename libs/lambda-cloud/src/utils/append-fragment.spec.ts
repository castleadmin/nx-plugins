import { faker } from '@faker-js/faker';
import { Tree } from '@nx/devkit';
import { readFile } from 'node:fs/promises';
import { appendFragment } from './append-fragment';
import { getVersions } from './versions';

jest.mock('node:fs/promises', () => {
  const originalModule = jest.requireActual('node:fs/promises');

  return {
    __esModule: true,
    ...originalModule,
    readFile: jest.fn(),
  };
});

describe('appendFragment', () => {
  let tree: Tree;
  let originalContent: string;
  let appendPath: string;
  let fragmentContent: string;
  let fragmentPath: string;
  let testVariable1: string;
  let testVariable11: string;
  let testVariable2: string;

  beforeEach(() => {
    tree = {
      exists: jest.fn(),
      read: jest.fn(),
      write: jest.fn(),
    } as unknown as Tree;
    originalContent = faker.lorem.lines(10);
    fragmentContent = `${faker.lorem.lines(
      1
    )} <%= testVariable1 %> ${faker.lorem.lines(
      3
    )} <%= testVariable2 %> ${faker.lorem.lines(2)}`;
    console.log('originalContent', originalContent);

    (readFile as jest.MockedFunction<typeof readFile>).mockImplementation(() =>
      Promise.resolve(fragmentContent)
    );
    (tree.exists as jest.MockedFunction<typeof tree.exists>).mockImplementation(
      () => true
    );
    (tree.read as jest.MockedFunction<typeof tree.read>).mockImplementation(
      () => originalContent
    );

    testVariable1 = faker.word.sample();
    testVariable11 = faker.word.sample();
    testVariable2 = faker.word.sample();
  });

  it('Should concatenate the original content with the fragment content.', async () => {
    await appendFragment(
      tree,
      {
        testVariable1,
        testVariable11,
      },
      {
        testVariable2,
      },
      getVersions(),
      {
        appendFilePath: appendPath,
        fragmentPathResolved: fragmentPath,
      }
    );

    expect(tree.write).toHaveBeenCalledTimes(1);
    expect(tree.write).toHaveBeenCalledWith(
      appendPath,
      `${originalContent}\r\n${fragmentContent
        .replace('<%= testVariable1 %>', testVariable1)
        .replace('<%= testVariable2 %>', testVariable2)}`
    );
  });

  it('Should only write the fragment content, if the original content is empty.', async () => {
    (tree.read as jest.MockedFunction<typeof tree.read>).mockImplementationOnce(
      () => ''
    );

    await appendFragment(
      tree,
      {
        testVariable1,
        testVariable11,
      },
      {
        testVariable2,
      },
      getVersions(),
      {
        appendFilePath: appendPath,
        fragmentPathResolved: fragmentPath,
      }
    );

    expect(tree.write).toHaveBeenCalledTimes(1);
    expect(tree.write).toHaveBeenCalledWith(
      appendPath,
      `${fragmentContent
        .replace('<%= testVariable1 %>', testVariable1)
        .replace('<%= testVariable2 %>', testVariable2)}`
    );
  });

  it("Should throw an error, if the append file doesn't exist.", async () => {
    (
      tree.exists as jest.MockedFunction<typeof tree.exists>
    ).mockImplementationOnce(() => false);

    await expect(
      appendFragment(
        tree,
        {
          testVariable1,
          testVariable11,
        },
        {
          testVariable2,
        },
        getVersions(),
        {
          appendFilePath: appendPath,
          fragmentPathResolved: fragmentPath,
        }
      )
    ).rejects.toBeInstanceOf(Error);

    expect(tree.write).toHaveBeenCalledTimes(0);
  });
});
