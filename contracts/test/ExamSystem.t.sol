// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ExamRegistry} from "../src/ExamRegistry.sol";
import {ScoreAnchor} from "../src/ScoreAnchor.sol";

contract ExamSystemTest is Test {
    ExamRegistry internal registry;
    ScoreAnchor internal anchor;
    address internal admin = address(0xA11);
    address internal relayer = address(0xB22);
    address internal lecturer = address(0xC33);

    bytes32 internal examKey = keccak256("exam1");
    bytes32 internal studentC = keccak256("student1");

    function setUp() public {
        vm.startPrank(admin);
        registry = new ExamRegistry(admin);
        registry.grantRole(registry.REGISTRAR_ROLE(), relayer);
        anchor = new ScoreAnchor(admin, relayer);
        vm.stopPrank();
    }

    function testCreateExamAndAnchorScore() public {
        vm.prank(relayer);
        registry.createExam(examKey, bytes32(uint256(1)), 1, 2, lecturer);

        bytes32 scoreHash = keccak256(abi.encodePacked(uint256(1), uint256(80), uint256(1)));
        bytes32 metaHash = keccak256("meta");

        vm.prank(relayer);
        anchor.recordScore(examKey, studentC, scoreHash, metaHash);

        vm.expectRevert();
        vm.prank(relayer);
        anchor.recordScore(examKey, studentC, scoreHash, metaHash);
    }
}
