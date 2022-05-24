

# StakeborgDao.xyz Front-end badges

## Users API
**Get a list of users info with erc20 addresses by the different badge type:**
- username
- name
- email
- erc20

_**Note:**_
The route is protected so you need to provide authentication headers. The user you are making the request as should be at least Editor role.

**Send request example:**
```
var config = {
  method: 'get',
  url: 'https://stakeborgdao.xyz/wp-json/badges/v1/users?type=100|250|500|1000|with-erc20&format=array|csv',
  headers: { 
    'Authorization': 'Basic Z2FicmllbDpZV1pZIFd4R1UgZVN4biBpN0taIDk4ZjYgWWRtSg=='
  }
};
```
Basic authentication is the standard in the industry. it is a base64_encode string complied from your username and Application password like base64encode(user:app_pass).

Example in PHP:
$username = 'gabriel'; // site username
$application_password = 'Xo9c 9vGs AOBG nXb0 FPpr W5vO';
  
echo base64_encode($username.':'.$application_password);

Application passwords will be enabled after this commit and you can generate one from your WordPress profile(just make sure to be logged in):
https://stakeborgdao.xyz/wp-admin/profile.php
<img width="1147" alt="app-passwords-profile-area" src="https://user-images.githubusercontent.com/5703385/153726256-f5035ddb-14f7-4cf0-97b3-500c326bf165.png">

Example response:
`{"1":{"username":"gabriel","name":"Gabi","email":"gabriel@codez.ro","erc20":"0x11122330004123123"}}`
