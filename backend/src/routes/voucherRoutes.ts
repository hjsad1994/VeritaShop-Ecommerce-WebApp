import express, { Router } from 'express';
import { authenticate, authorize, validate } from '../middleware';
import { VoucherValidation } from '../validations/VoucherValidation';
import { VoucherController } from '../controllers/VoucherController';

export const createVoucherRoutes = (): Router => {
  const router = express.Router();
  const controller = new VoucherController();

  router.use(authenticate, authorize('ADMIN', 'MANAGER'));

  router.get('/', validate(VoucherValidation.list()), controller.getVouchers);
  router.get('/:id', controller.getVoucher);
  router.post('/', validate(VoucherValidation.create()), controller.createVoucher);
  router.put('/:id', validate(VoucherValidation.update()), controller.updateVoucher);
  router.patch('/:id/toggle', validate(VoucherValidation.toggle()), controller.toggleVoucher);
  router.delete('/:id', controller.deleteVoucher);

  return router;
};

