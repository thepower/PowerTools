// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StorageRF3 {
  enum TasksStatus {
    TaskAdded,
    TaskUpdated,
    UploadComplete,
    AllnodeSync
  }

  struct StorageNode {
    uint256 id;
    address owner;
    string baseUrls;
    string uploadUrl;
  }

  struct StorageTask {
    uint256 id;
    address owner;
    string name;
    uint256 hash;
    uint256 size;
    uint256 time;
    uint256 expire;
    uint256 uploader;
    TasksStatus status;
    uint256 version;
    uint256 syncTime;
  }
  struct UploadTaskHistory {
    uint256 countUploaders;
    mapping(uint256 => uint256) uploadTimes;
  }

  uint public constant redudancyFactor = 3;

  mapping(uint256 => StorageNode) public storageNodes;
  uint256 public storageNodesCount;
  mapping(address => uint) public storageNodesId;
  mapping(uint256 => StorageTask) public storageTasks;
  uint256 public storageTasksCount;
  mapping(address => mapping(string => uint256)) public taskByName;

  uint256 public uploaderIndex;
  mapping(uint256 => UploadTaskHistory) public uploadHistory;
  uint256 createTime;
  mapping(uint256 => uint256) public tasksHistory;
  uint256 public tasksHistoryCount;
  mapping(uint => uint) public tasksBalance;
  mapping(uint => uint) public providersBalance;

  event providerRegister(uint provdireId);
  event providerUpdate(uint provdireId);
  event taskAdd(uint _taskId);
  event completeUpload(uint _provdireId, uint _taskId);
  event completeTaskUpload(uint _taskId);

  constructor() {}

  function registerProvider(string memory _uploadUrl, string memory _baseUrls) public returns (uint256 providerId) {
    require(storageNodesId[msg.sender] == 0, 'Storage node allready exist');
    storageNodesCount += 1;
    require(storageNodesCount <= redudancyFactor, 'Count of sorage node must be equal redudancyFactor');

    storageNodes[storageNodesCount] = StorageNode(storageNodesCount, msg.sender, _baseUrls, _uploadUrl);
    storageNodesId[msg.sender] = storageNodesCount;
    emit providerRegister(storageNodesCount);
    return storageNodesCount;
  }

  function deleteProvider() public returns (bool _deleted) {
    require(storageNodesId[msg.sender] != 0, 'Id nodes dosent exist');
    delete (storageNodesId[msg.sender]);

    return true;
  }

  function updateProvider(uint256 _id, string memory _uploadUrl, string memory _baseUrls) public {
    require(storageNodes[_id].id == _id, 'Id nodes dosent exist');
    require(storageNodes[_id].owner == msg.sender, 'Not owner of this node');

    storageNodes[_id] = StorageNode(_id, msg.sender, _baseUrls, _uploadUrl);
    emit providerUpdate(_id);
  }

  function nextUploader() private returns (uint256) {
    require(storageNodesCount > 0, 'No storage node');

    if (storageNodesCount == 1) {
      return 1;
    }
    if (uploaderIndex == storageNodesCount) {
      uploaderIndex = 1;
    } else {
      uploaderIndex += 1;
    }
    return uploaderIndex;
  }

  function time() private returns (uint256) {
    address timeAddress = address(0xAFFFFFFFFF000000);

    (bool success, bytes memory data) = timeAddress.call('');
    require(success, 'time call exeption');
    bytes32 timeData = bytes32(data);
    return uint256(timeData) / 1000;
  }

  function addTask(
    string memory _name,
    uint256 _hash,
    uint _expire,
    uint _size
  ) public payable returns (uint256 taskId) {
    require(msg.value > 0, 'need more token');
    require(taskIdByName(msg.sender, _name) == 0, 'task allready exist');

    //TODO calculate that tokens enouth for storage

    storageTasksCount += 1;
    uint256 _time = time();
    uint256 _uploader = nextUploader();

    storageTasks[storageTasksCount] = StorageTask(
      storageTasksCount,
      msg.sender,
      _name,
      _hash,
      _size,
      _time,
      _expire,
      _uploader,
      TasksStatus.TaskAdded,
      1,
      0
    );
    taskByName[msg.sender][_name] = storageTasksCount;
    addToTasksHistory(storageTasksCount);
    tasksBalance[storageTasksCount] = msg.value;
    emit taskAdd(storageTasksCount);
    return storageTasksCount;
  }

  function updateTask(uint256 _id, uint256 _hash, uint _expire, uint _size) public payable {
    require(msg.value > 0, 'need more token');
    require(msg.sender == storageTasks[_id].owner, 'not your task');
    require(storageTasks[_id].status == TasksStatus.AllnodeSync, 'first fullsync task');

    //TODO calculate token to pay for previus version task and move it to providers
    //TODO calculate that tokens enouth for storage

    uint256 _uploader = nextUploader();
    storageTasks[_id] = StorageTask(
      _id,
      storageTasks[_id].owner,
      storageTasks[_id].name,
      _hash,
      _size,
      storageTasks[_id].time,
      _expire,
      _uploader,
      TasksStatus.TaskUpdated,
      storageTasks[_id].version + 1,
      0
    );

    uploadHistory[_id].countUploaders = 0;
    addToTasksHistory(storageTasksCount);
    tasksBalance[storageTasksCount] += msg.value;
    emit taskAdd(storageTasksCount);
  }

  function increaseTaskBalance(uint256 _id) public payable {
    tasksBalance[_id] += msg.value;
  }

  function increaseTaskStorageTime(uint256 _id, uint _expire) public payable {
    tasksBalance[_id] += msg.value;
    require(_expire > storageTasks[_id].expire, 'new storage time must biger');
    ///TODO calculate if tasksBalance[_id] enouth for new storage time
  }

  function addToTasksHistory(uint256 _taskId) private returns (uint256) {
    tasksHistoryCount = tasksHistoryCount + 1;
    tasksHistory[tasksHistoryCount] = _taskId;
    return tasksHistoryCount;
  }

  function findStrorageNode(address _address) public view returns (uint256 nodeId) {
    return storageNodesId[_address];
  }

  function clearUploadCounts(uint256 _taskId) private {
    for (uint i = 1; i < storageNodesCount + 1; i++) {
      delete uploadHistory[_taskId].uploadTimes[i];
    }
  }

  function uploadComplete(uint256 _id) public {
    uint uploader_id = findStrorageNode(msg.sender);
    require(uploader_id > 0, 'Not storage node owner');
    if (uploadHistory[_id].uploadTimes[uploader_id] == 0) {
      uploadHistory[_id].countUploaders++;
      emit completeUpload(uploader_id, _id);
      uploadHistory[_id].uploadTimes[uploader_id] = time();
      storageTasks[_id].status = TasksStatus.UploadComplete; //at least one uplaod complete
    }
    if (uploadHistory[_id].countUploaders >= storageNodesCount) {
      storageTasks[_id].status = TasksStatus.AllnodeSync; //upload complete all storage nodes
      storageTasks[_id].syncTime = time();
      clearUploadCounts(_id);
      emit completeTaskUpload(_id);
    }
  }

  function getProvider(uint _id) public view returns (address owner, string memory baseUrls, string memory uploadUrl) {
    return (storageNodes[_id].owner, storageNodes[_id].baseUrls, storageNodes[_id].uploadUrl);
  }

  function getTask(
    uint256 _id
  )
    public
    view
    returns (
      address owner,
      string memory name,
      uint256 hash,
      uint256 size,
      uint256 expire,
      uint256 uploader,
      uint256 status
    )
  {
    return (
      storageTasks[_id].owner,
      storageTasks[_id].name,
      storageTasks[_id].hash,
      storageTasks[_id].size,
      storageTasks[_id].expire,
      storageTasks[_id].uploader,
      uint(storageTasks[_id].status)
    );
  }

  function getTaskStruct(uint256 _id) public view returns (StorageTask memory _storageTasks) {
    return (storageTasks[_id]);
  }

  function getTaskHistory(uint _id) public view returns (uint256 taskId) {
    return (tasksHistory[_id]);
  }

  function getTaskBalance(uint256 _id) public view returns (uint taskBalance) {
    return (tasksBalance[_id]);
  }

  function taskIdByName(address _account, string memory _name) public view returns (uint256 taskID) {
    return (taskByName[_account][_name]);
  }

  function getProviderBalance(uint _id) public view returns (uint providesBalance) {
    return (providersBalance[_id]);
  }
}
