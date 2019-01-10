import { OverviewsModule } from './overviews.module';

describe('OverviewsModule', () => {
  let overviewsModule: OverviewsModule;

  beforeEach(() => {
    overviewsModule = new OverviewsModule();
  });

  it('should create an instance', () => {
    expect(overviewsModule).toBeTruthy();
  });
});
