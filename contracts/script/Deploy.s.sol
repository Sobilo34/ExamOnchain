// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ExamRegistry} from "../src/ExamRegistry.sol";
import {ScoreAnchor} from "../src/ScoreAnchor.sol";

contract DeployScript is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(pk);
        address relayer = vm.envOr("RELAYER_ADDRESS", deployer);

        vm.startBroadcast(pk);

        ExamRegistry registry = new ExamRegistry(deployer);
        registry.grantRole(registry.REGISTRAR_ROLE(), relayer);

        ScoreAnchor anchor = new ScoreAnchor(deployer, relayer);

        vm.stopBroadcast();

        console2.log("ExamRegistry:", address(registry));
        console2.log("ScoreAnchor:", address(anchor));
        console2.log("Admin:", deployer);
        console2.log("Relayer:", relayer);
    }
}
