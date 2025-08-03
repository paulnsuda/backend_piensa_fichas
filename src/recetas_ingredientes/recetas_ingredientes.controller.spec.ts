import { Test, TestingModule } from '@nestjs/testing';
import { RecetasIngredientesController } from './recetas_ingredientes.controller';

describe('RecetasIngredientesController', () => {
  let controller: RecetasIngredientesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecetasIngredientesController],
    }).compile();

    controller = module.get<RecetasIngredientesController>(RecetasIngredientesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
