import { Environment, getProfile, getRegion } from './environment';

describe('environment', () => {
  describe('getProfile', () => {
    describe('Given a Dev environment,', () => {
      let environment: Environment;

      beforeEach(() => {
        environment = Environment.Dev;
        process.env['E2E_DEV_PROFILE'] = 'DevProfile';
      });

      test('should return the Dev profile.', () => {
        expect(getProfile(environment)).toBe('DevProfile');
      });

      test("should throw an error if the environment variable E2E_DEV_PROFILE isn't defined.", () => {
        delete process.env['E2E_DEV_PROFILE'];
        expect(() => getProfile(environment)).toThrow(Error);
      });
    });

    describe('Given a Stage environment,', () => {
      let environment: Environment;

      beforeEach(() => {
        environment = Environment.Stage;
        process.env['E2E_STAGE_PROFILE'] = 'StageProfile';
      });

      test('should return the Stage profile.', () => {
        expect(getProfile(environment)).toBe('StageProfile');
      });

      test("should throw an error if the environment variable E2E_STAGE_PROFILE isn't defined.", () => {
        delete process.env['E2E_STAGE_PROFILE'];
        expect(() => getProfile(environment)).toThrow(Error);
      });
    });

    describe('Given a Prod environment,', () => {
      let environment: Environment;

      beforeEach(() => {
        environment = Environment.Prod;
        process.env['E2E_PROD_PROFILE'] = 'ProdProfile';
      });

      test('should return the Prod profile.', () => {
        expect(getProfile(environment)).toBe('ProdProfile');
      });

      test("should throw an error if the environment variable E2E_PROD_PROFILE isn't defined.", () => {
        delete process.env['E2E_PROD_PROFILE'];
        expect(() => getProfile(environment)).toThrow(Error);
      });
    });

    describe('Given an unknown environment,', () => {
      let environment: Environment;

      beforeEach(() => {
        environment = 'unknown' as unknown as Environment;
      });

      test('should throw an error.', () => {
        expect(() => getProfile(environment)).toThrow(Error);
      });
    });
  });

  describe('getRegion', () => {
    describe('Given a Dev environment,', () => {
      let environment: Environment;

      beforeEach(() => {
        environment = Environment.Dev;
        process.env['E2E_DEV_REGION'] = 'eu-west-1';
      });

      test('should return the Dev region.', () => {
        expect(getRegion(environment)).toBe('eu-west-1');
      });

      test("should throw an error if the environment variable E2E_DEV_REGION isn't defined.", () => {
        delete process.env['E2E_DEV_REGION'];
        expect(() => getRegion(environment)).toThrow(Error);
      });
    });

    describe('Given a Stage environment,', () => {
      let environment: Environment;

      beforeEach(() => {
        environment = Environment.Stage;
        process.env['E2E_STAGE_REGION'] = 'eu-west-2';
      });

      test('should return the Stage region.', () => {
        expect(getRegion(environment)).toBe('eu-west-2');
      });

      test("should throw an error if the environment variable E2E_STAGE_REGION isn't defined.", () => {
        delete process.env['E2E_STAGE_REGION'];
        expect(() => getRegion(environment)).toThrow(Error);
      });
    });

    describe('Given a Prod environment,', () => {
      let environment: Environment;

      beforeEach(() => {
        environment = Environment.Prod;
        process.env['E2E_PROD_REGION'] = 'eu-west-3';
      });

      test('should return the Prod region.', () => {
        expect(getRegion(environment)).toBe('eu-west-3');
      });

      test("should throw an error if the environment variable E2E_PROD_REGION isn't defined.", () => {
        delete process.env['E2E_PROD_REGION'];
        expect(() => getRegion(environment)).toThrow(Error);
      });
    });

    describe('Given an unknown environment,', () => {
      let environment: Environment;

      beforeEach(() => {
        environment = 'unknown' as unknown as Environment;
      });

      test('should throw an error.', () => {
        expect(() => getRegion(environment)).toThrow(Error);
      });
    });
  });
});
