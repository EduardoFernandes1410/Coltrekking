-- phpMyAdmin SQL Dump
-- version 4.8.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 19-Set-2018 às 22:23
-- Versão do servidor: 10.1.33-MariaDB
-- PHP Version: 7.2.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `coltrekking`
--

-- --------------------------------------------------------

--
-- Estrutura da tabela `evento`
--

CREATE TABLE `evento` (
  `ID` int(11) NOT NULL,
  `Nome` text NOT NULL,
  `Tipo` int(11) NOT NULL,
  `TipoTrekking` text,
  `DataInicio` text NOT NULL,
  `DataFim` text,
  `ano` float NOT NULL DEFAULT '0',
  `Local` text NOT NULL,
  `Dificuldade` text,
  `NumeroMax` int(11) NOT NULL,
  `DataInscricao` text NOT NULL,
  `FimInscricao` text NOT NULL,
  `Finalizado` tinyint(4) DEFAULT '0',
  `fatorKevento` float DEFAULT '0',
  `distancia` float NOT NULL DEFAULT '0',
  `subdesc` float NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura da tabela `pessoa`
--

CREATE TABLE `pessoa` (
  `Nome` text,
  `Email` text,
  `Foto` text,
  `ID` varchar(255) NOT NULL,
  `FatorK` float DEFAULT '0',
  `Posicao` int(11) DEFAULT NULL,
  `ListaNegra` tinyint(4) DEFAULT '0',
  `Admin` tinyint(4) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura da tabela `pessoa-evento`
--

CREATE TABLE `pessoa-evento` (
  `IDPessoa` varchar(255) NOT NULL DEFAULT '',
  `IDEvento` int(11) NOT NULL,
  `Colocacao` int(11) NOT NULL,
  `ListaEspera` tinyint(4) NOT NULL,
  `DataInscricao` varchar(255) NOT NULL,
  `DataHoraInscricao` datetime NOT NULL,
  `FatorKPessoaEvento` float NOT NULL DEFAULT '0',
  `listaNegraEvento` float NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estrutura da tabela `postagem`
--

CREATE TABLE `postagem` (
  `ID` int(11) NOT NULL,
  `Texto` text NOT NULL,
  `Fixado` tinyint(4) NOT NULL,
  `EventoID` int(11) NOT NULL,
  `Data` text NOT NULL,
  `AdminID` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `evento`
--
ALTER TABLE `evento`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `ID_UNIQUE` (`ID`);

--
-- Indexes for table `pessoa`
--
ALTER TABLE `pessoa`
  ADD UNIQUE KEY `ID_UNIQUE` (`ID`),
  ADD UNIQUE KEY `ID` (`ID`),
  ADD UNIQUE KEY `ID_2` (`ID`),
  ADD UNIQUE KEY `ID_3` (`ID`),
  ADD UNIQUE KEY `ID_4` (`ID`),
  ADD UNIQUE KEY `ID_5` (`ID`),
  ADD UNIQUE KEY `ID_6` (`ID`),
  ADD UNIQUE KEY `ID_7` (`ID`),
  ADD UNIQUE KEY `ID_8` (`ID`);

--
-- Indexes for table `pessoa-evento`
--
ALTER TABLE `pessoa-evento`
  ADD PRIMARY KEY (`IDPessoa`,`IDEvento`),
  ADD KEY `idx_pessoa-evento_IDEvento` (`IDEvento`);

--
-- Indexes for table `postagem`
--
ALTER TABLE `postagem`
  ADD PRIMARY KEY (`ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `evento`
--
ALTER TABLE `evento`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `postagem`
--
ALTER TABLE `postagem`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
