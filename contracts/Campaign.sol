pragma solidity >=0.4.21 <0.7.0;

contract CampaignFactory {
    address[] public totalCampaigns;

    event NewCampaign(
        address indexed campaignAddress,
        address indexed ownerAddress,
        uint256 minimumValue,
        string indexed ownerID
    );

    function createCampaign(uint256 _minimum, string memory _ownerID) public {
        Campaign newCampaign = new Campaign(_minimum, _ownerID, msg.sender);
        totalCampaigns.push(address(newCampaign));

        emit NewCampaign(address(newCampaign), msg.sender, _minimum, _ownerID);
    }

    function getTotalCampaigns() public view returns (address[] memory) {
        return totalCampaigns;
    }
}

contract Campaign {
    constructor(
        uint256 _minimun,
        string memory _ownerID,
        address _creator
    ) public {
        minimumContribution = _minimun;
        owner = _creator;
        ownerID = _ownerID;
    }

    string ownerID;
    uint256 minimumContribution;
    address public owner;
    mapping(string => address[]) approvers;
    string[] approverIDs;
    uint256 public approveCounts;
    RequestInfo[] public requests;

    struct RequestInfo {
        string description;
        uint256 value;
        uint256 approvalCounts;
        bool complete;
        address payable recipient;
        mapping(string => bool) approvals; // userID => bool
    }

    event Contribute(
        uint256 balance,
        uint256 approveCounts,
        uint256 contributionAmount,
        string indexed approverID,
        address indexed approverAddress
    );

    modifier restricted(string memory _ownerID) {
        require(
            msg.sender == owner &&
                keccak256(abi.encodePacked(ownerID)) ==
                keccak256(abi.encodePacked(_ownerID)),
            "You are not the owner"
        );
        _;
    }

    function getMinmum() public view returns (uint256) {
        return minimumContribution;
    }

    function contribute(string memory _approverID) public payable {
        require(
            msg.value >= minimumContribution,
            "donation must be more than the minimumContribution"
        );
        if (approvers[_approverID].length < 1) {
            approveCounts++;
            approvers[_approverID].push(msg.sender);
            approverIDs.push(_approverID);
        } else {
            // 다른 계좌를 사용했을 경우에는 계좌 추가
            address[] storage approverAccounts = approvers[_approverID];
            bool isNew = true;
            for (uint256 i = 0; i < approverAccounts.length; i++) {
                if (approverAccounts[i] == msg.sender) {
                    isNew = false;
                }
            }

            if (isNew == true) {
                approvers[_approverID].push(msg.sender);
            }
        }

        emit Contribute(
            address(this).balance,
            approveCounts,
            msg.value,
            _approverID,
            msg.sender
        );
    }

    
    function createRequest(
        string memory _description,
        uint256 _value,
        address payable _recipient,
        string memory _ownerID
    ) public restricted(_ownerID) {
        require(_value <= address(this).balance, "Too much value");
        RequestInfo memory newRequest = RequestInfo({
            description: _description,
            value: _value,
            recipient: _recipient,
            complete: false,
            approvalCounts: 0
        });

        requests.push(newRequest);
    }

    function approveRequest(uint256 _index, string memory _approverID) public {
        require(approvers[_approverID].length > 0, "You are not a contributor");
        RequestInfo storage request = requests[_index];
        require(
            !request.approvals[_approverID],
            "You have aleady signed before"
        );

        request.approvals[_approverID] = true;
        request.approvalCounts++;
    }

    function finalizeRequest(uint256 _index, string memory _callerID) public {
        string memory ownersID = ownerID;
        require(
            approvers[_callerID].length > 0 ||
                keccak256(abi.encodePacked(ownersID)) ==
                keccak256(abi.encodePacked(_callerID)),
            "You are not allowed to call this function"
        );
        RequestInfo storage request = requests[_index];
        require(
            request.approvalCounts > (approveCounts / 2),
            "Not enough approvals"
        );
        require(!request.complete, "This request was completed");

        request.recipient.transfer(request.value);
        request.complete = true;
    }

    function getSummary()
        public
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256,
            address,
            string memory,
            address
        )
    {
        return (
            minimumContribution,
            address(this).balance,
            requests.length,
            approveCounts,
            owner,
            ownerID,
            address(this)
        );
    }

    function getRequestCounts() public view returns (uint256) {
        return requests.length;
    }
}
