// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/// @notice On-chain metadata anchor for exams. Registrar is the trusted backend relayer.
contract ExamRegistry is AccessControl {
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");

    struct ExamMeta {
        bytes32 contentHash;
        uint64 opensAt;
        uint64 closesAt;
        address lecturer;
        bool published;
        bytes32 rosterMerkleRoot;
        bool exists;
    }

    mapping(bytes32 examKey => ExamMeta) public exams;

    event ExamCreated(
        bytes32 indexed examKey, address indexed lecturer, bytes32 contentHash, uint64 opensAt, uint64 closesAt
    );
    event ExamUpdated(bytes32 indexed examKey, uint64 opensAt, uint64 closesAt);
    event RosterRootSet(bytes32 indexed examKey, bytes32 rosterMerkleRoot);
    event PublishedSet(bytes32 indexed examKey, bool published);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    function createExam(
        bytes32 examKey,
        bytes32 contentHash,
        uint64 opensAt,
        uint64 closesAt,
        address lecturer
    ) external onlyRole(REGISTRAR_ROLE) {
        require(!exams[examKey].exists, "ExamRegistry: exists");
        exams[examKey] = ExamMeta({
            contentHash: contentHash,
            opensAt: opensAt,
            closesAt: closesAt,
            lecturer: lecturer,
            published: false,
            rosterMerkleRoot: bytes32(0),
            exists: true
        });
        emit ExamCreated(examKey, lecturer, contentHash, opensAt, closesAt);
    }

    function updateExamWindow(bytes32 examKey, uint64 opensAt, uint64 closesAt) external onlyRole(REGISTRAR_ROLE) {
        ExamMeta storage e = exams[examKey];
        require(e.exists, "ExamRegistry: no exam");
        e.opensAt = opensAt;
        e.closesAt = closesAt;
        emit ExamUpdated(examKey, opensAt, closesAt);
    }

    function setRosterRoot(bytes32 examKey, bytes32 rosterMerkleRoot) external onlyRole(REGISTRAR_ROLE) {
        ExamMeta storage e = exams[examKey];
        require(e.exists, "ExamRegistry: no exam");
        e.rosterMerkleRoot = rosterMerkleRoot;
        emit RosterRootSet(examKey, rosterMerkleRoot);
    }

    function setPublished(bytes32 examKey, bool published) external onlyRole(REGISTRAR_ROLE) {
        ExamMeta storage e = exams[examKey];
        require(e.exists, "ExamRegistry: no exam");
        e.published = published;
        emit PublishedSet(examKey, published);
    }
}
