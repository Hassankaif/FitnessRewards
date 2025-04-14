// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FitnessRewards {
    address public owner;
    uint256 public tokenRate; // Tokens earned per workout
    uint256 public totalSupply;

    struct Workout {
        string workoutType;
        uint256 duration; // in minutes
        uint256 timestamp;
        uint256 tokensEarned;
    }

    struct Reward {
        string name;
        uint256 cost;
        bool available;
    }

    mapping(address => Workout[]) private userWorkouts;
    mapping(address => uint256) public userTokens;
    mapping(uint256 => Reward) public rewards;
    uint256 public rewardCounter;

    event WorkoutLogged(address indexed user, string workoutType, uint256 duration, uint256 tokensEarned);
    event RewardAdded(uint256 rewardId, string name, uint256 cost);
    event RewardRedeemed(address indexed user, uint256 rewardId, string rewardName);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
event ContractInitialized(address indexed owner);

constructor(uint256 _tokenRate) {
       require(_tokenRate > 0, "Token rate must be positive");
         emit ContractInitialized(msg.sender);
      owner = msg.sender;

}



    function logWorkout(string memory _workoutType, uint256 _duration) external {
        require(_duration > 0, "Workout duration must be positive");

        uint256 tokensEarned = _duration * tokenRate;
        userTokens[msg.sender] += tokensEarned;
        totalSupply += tokensEarned;

        userWorkouts[msg.sender].push(Workout({
            workoutType: _workoutType,
            duration: _duration,
            timestamp: block.timestamp,
            tokensEarned: tokensEarned
        }));

        emit WorkoutLogged(msg.sender, _workoutType, _duration, tokensEarned);
    }
    
    function toggleRewardAvailability(uint256 _rewardId, bool _status) external onlyOwner {
    rewards[_rewardId].available = _status;
}

    function addReward(string memory _name, uint256 _cost) external onlyOwner {
        rewards[rewardCounter] = Reward({
            name: _name,
            cost: _cost,
            available: true
        });

        emit RewardAdded(rewardCounter, _name, _cost);
        rewardCounter++;
    }

    function redeemReward(uint256 _rewardId) external {
        require(rewards[_rewardId].available, "Reward not available");
        require(userTokens[msg.sender] >= rewards[_rewardId].cost, "Not enough tokens");

        userTokens[msg.sender] -= rewards[_rewardId].cost;
        emit RewardRedeemed(msg.sender, _rewardId, rewards[_rewardId].name);
    }

    function getUserTokens(address _user) external view returns (uint256) {
        return userTokens[_user];
    }

    function getUserWorkouts(address _user) external view returns (Workout[] memory) {
        return userWorkouts[_user];
    }
}
