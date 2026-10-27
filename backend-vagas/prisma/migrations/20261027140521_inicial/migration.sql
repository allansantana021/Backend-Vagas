-- CreateTable
CREATE TABLE `status` (
    `id_status` INTEGER NOT NULL AUTO_INCREMENT,
    `status_nome` VARCHAR(45) NULL,
    `status_descricao` TEXT NULL,

    PRIMARY KEY (`id_status`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `area` (
    `area_id` INTEGER NOT NULL AUTO_INCREMENT,
    `area_nome` VARCHAR(100) NULL,
    `area_status` INTEGER NULL,

    PRIMARY KEY (`area_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nivel` (
    `nivel_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nivel_string` VARCHAR(45) NULL,
    `nivel_status` INTEGER NULL,

    PRIMARY KEY (`nivel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vaga` (
    `vaga_id` INTEGER NOT NULL AUTO_INCREMENT,
    `vaga_titulo` VARCHAR(100) NULL,
    `vaga_descricao` TEXT NULL,
    `vaga_salario_min` DECIMAL(10, 2) NULL,
    `vaga_salario_max` DECIMAL(10, 2) NULL,
    `vaga_status` VARCHAR(45) NULL,
    `vaga_cidade` VARCHAR(100) NULL,
    `vaga_modalidade` VARCHAR(20) NULL,
    `vaga_tipo_contrato` VARCHAR(20) NULL,
    `vaga_publicada_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status_id` INTEGER NOT NULL,
    `area_id` INTEGER NOT NULL,
    `nivel_id` INTEGER NOT NULL,
    `empresa_id` INTEGER NOT NULL,
    `recrutador_id` INTEGER NOT NULL,

    INDEX `fk_vaga_status1_idx`(`status_id`),
    INDEX `fk_vaga_area1_idx`(`area_id`),
    INDEX `fk_vaga_nivel1_idx`(`nivel_id`),
    INDEX `idx_vaga_empresa`(`empresa_id`),
    PRIMARY KEY (`vaga_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requisito` (
    `requisito_id` INTEGER NOT NULL AUTO_INCREMENT,
    `requisito_descricao` TEXT NULL,
    `requisito_status` INTEGER NULL,
    `vaga_id` INTEGER NOT NULL,

    INDEX `fk_requisito_vaga1_idx`(`vaga_id`),
    PRIMARY KEY (`requisito_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill` (
    `skill_id` INTEGER NOT NULL AUTO_INCREMENT,
    `skill_nome` VARCHAR(45) NULL,
    `skill_descricao` TEXT NULL,
    `skill_status` INTEGER NULL,
    `vaga_id` INTEGER NOT NULL,

    INDEX `fk_skill_vaga1_idx`(`vaga_id`),
    PRIMARY KEY (`skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `candidatura` (
    `candidatura_id` INTEGER NOT NULL AUTO_INCREMENT,
    `vaga_id` INTEGER NOT NULL,
    `aluno_id` INTEGER NOT NULL,
    `candidatura_status` VARCHAR(20) NOT NULL DEFAULT 'Enviada',
    `candidatura_criada_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_candidatura_aluno`(`aluno_id`),
    UNIQUE INDEX `uq_candidatura_vaga_aluno`(`vaga_id`, `aluno_id`),
    PRIMARY KEY (`candidatura_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `vaga` ADD CONSTRAINT `vaga_status_id_fkey` FOREIGN KEY (`status_id`) REFERENCES `status`(`id_status`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vaga` ADD CONSTRAINT `vaga_area_id_fkey` FOREIGN KEY (`area_id`) REFERENCES `area`(`area_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `vaga` ADD CONSTRAINT `vaga_nivel_id_fkey` FOREIGN KEY (`nivel_id`) REFERENCES `nivel`(`nivel_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `requisito` ADD CONSTRAINT `requisito_vaga_id_fkey` FOREIGN KEY (`vaga_id`) REFERENCES `vaga`(`vaga_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill` ADD CONSTRAINT `skill_vaga_id_fkey` FOREIGN KEY (`vaga_id`) REFERENCES `vaga`(`vaga_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidatura` ADD CONSTRAINT `candidatura_vaga_id_fkey` FOREIGN KEY (`vaga_id`) REFERENCES `vaga`(`vaga_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
