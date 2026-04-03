// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Tamper-evident score commitments. Only WRITER (backend relayer) may record.
contract ScoreAnchor is AccessControl, ReentrancyGuard {
    bytes32 public constant WRITER_ROLE = keccak256("WRITER_ROLE");

    mapping(bytes32 examKey => mapping(bytes32 studentCommitment => bool)) public recorded;

    uint256 private _nonce;

    event ScoreRecorded(
        bytes32 indexed examKey,
        bytes32 indexed studentCommitment,
        bytes32 scoreHash,
        bytes32 metadataHash,
        uint256 nonce
    );

    constructor(address admin, address writer) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(WRITER_ROLE, writer);
    }

    function recordScore(bytes32 examKey, bytes32 studentCommitment, bytes32 scoreHash, bytes32 metadataHash)
        external
        onlyRole(WRITER_ROLE)
        nonReentrant
    {
        require(!recorded[examKey][studentCommitment], "ScoreAnchor: duplicate");
        recorded[examKey][studentCommitment] = true;
        unchecked {
            _nonce++;
        }
        emit ScoreRecorded(examKey, studentCommitment, scoreHash, metadataHash, _nonce);
    }

    /// @dev Must match backend `computeScoreHash`.
    function hashScorePayload(uint256 attemptId, uint256 scorePercent, uint256 version) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(attemptId, scorePercent, version));
    }
}
