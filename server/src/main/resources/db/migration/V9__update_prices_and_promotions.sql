-- Update all prices to market average
UPDATE tb_product SET price = 399.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 1;
UPDATE tb_product SET price = 269.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 2;
UPDATE tb_product SET price = 209.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 3;
UPDATE tb_product SET price = 279.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 4;
UPDATE tb_product SET price = 799.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 5;
UPDATE tb_product SET price = 249.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 6;
UPDATE tb_product SET price = 199.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 7;
UPDATE tb_product SET price = 289.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 8;
UPDATE tb_product SET price = 399.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 9;
UPDATE tb_product SET price = 229.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 10;

UPDATE tb_product SET price = 99.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 11;
UPDATE tb_product SET price = 24.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 12;
UPDATE tb_product SET price = 119.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 13;
UPDATE tb_product SET price = 149.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 14;
UPDATE tb_product SET price = 59.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 15;
UPDATE tb_product SET price = 249.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 16;
UPDATE tb_product SET price = 69.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 17;
UPDATE tb_product SET price = 199.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 18;
UPDATE tb_product SET price = 129.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 19;
UPDATE tb_product SET price = 79.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 20;

UPDATE tb_product SET price = 199.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 21;
UPDATE tb_product SET price = 139.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 22;
UPDATE tb_product SET price = 34.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 23;
UPDATE tb_product SET price = 39.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 24;
UPDATE tb_product SET price = 159.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 25;
UPDATE tb_product SET price = 29.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 26;
UPDATE tb_product SET price = 149.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 27;
UPDATE tb_product SET price = 79.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 28;
UPDATE tb_product SET price = 44.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 29;
UPDATE tb_product SET price = 139.90, promo = FALSE, discount_type = NULL, discount_value = NULL WHERE id = 30;

-- Apply promos to Category 1 (3 products - 30%)
UPDATE tb_product SET promo = TRUE, discount_type = 'PERCENTAGE', discount_value = 15.00 WHERE id = 1;
UPDATE tb_product SET promo = TRUE, discount_type = 'VALUE', discount_value = 40.00 WHERE id = 3;
UPDATE tb_product SET promo = TRUE, discount_type = 'PERCENTAGE', discount_value = 25.00 WHERE id = 7;

-- Apply promos to Category 2 (3 products - 30%)
UPDATE tb_product SET promo = TRUE, discount_type = 'PERCENTAGE', discount_value = 20.00 WHERE id = 12;
UPDATE tb_product SET promo = TRUE, discount_type = 'VALUE', discount_value = 30.00 WHERE id = 13;
UPDATE tb_product SET promo = TRUE, discount_type = 'PERCENTAGE', discount_value = 30.00 WHERE id = 16;

-- Apply promos to Category 3 (2 products - 20%)
UPDATE tb_product SET promo = TRUE, discount_type = 'PERCENTAGE', discount_value = 10.00 WHERE id = 22;
UPDATE tb_product SET promo = TRUE, discount_type = 'VALUE', discount_value = 20.00 WHERE id = 28;
