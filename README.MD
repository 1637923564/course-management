# 远程服务器搭建和本地项目的上传
## 进入远程服务器终端
* 获取云服务器公网ip
* 打开本地系统终端：
```shell
$ ssh root@公网IP 
root@xx.xxx.xxx.xx password： # 输入云服务器密码
# # 出现以下提示代表已进入云服务器终端
Welcome to Alibaba Cloud Elastic Compute Service !
[root@laowangserver ~]# 
```

## 下载及配置node环境
> *此例中将 **Node** 安装到 **/usr/local/src** 目录*
* 进入[Node官网](http://nodejs.cn/download/)，复制 **Linux 二进制包 (x64)** 的跳转地址（这里以 https://npm.taobao.org/mirrors/node/v10.14.1/node-v10.14.1-linux-x64.tar.xz 为例）
* 打开云服务器终端选择**安装目录**
```shell
$ cd /usr/local/src
$ wget https://npm.taobao.org/mirrors/node/v10.14.1/node-v10.14.1-linux-x64.tar.xz # 下载nodejs压缩包
$ tar xvJf node-v10.14.1-linux-x64.tar.xz # 解压
$ rm -vf node-v10.14.1-linux-x64.tar.xz # 删除该压缩文件
$ cd node-v10.14.1-linux-x64/bin
$ ./node --version # 验证node是否可用
$ ./npm --version # 验证npm是否可用
```
* 配置 **Node** 及 **npm** 的环境变量：
```shell
$ ln -s /usr/local/src/node-v10.14.1-linux-x64/bin/node /usr/local/bin/node
$ ln -s /usr/local/src/node-v10.14.1-linux-x64/bin/npm /usr/local/bin/npm
```
## 下载及配置mongodb
>* *此例 **mongodb** 的安装路径: **/usr/local/mongodb** 。*
>* *数据存放路径： **/var/mongodb/data** 。*
>* *日志存放路径： **/var/mongodb/logs** 。*
* 进入[mongodb官网](https://www.mongodb.com/download-center/community)，在 **OS** 选项框中选择 **Linux 64-bit legacy x64** ，复制下载路径：例如————https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-4.0.4.tgz
* 打开云服务器终端安装mongodb
```shell 
$ cd /usr/local
$ wget https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-4.0.4.tgz # 下载mongodb压缩包
$ tar zxvf mongodb-linux-x86_64-4.0.4.tgz # 解压
$ rm -vf mongodb-linux-x86_64-4.0.4.tgz # 删除压缩包
$ mkdir mongodb #新建一个mongodb文件夹
$ mv mongodb-linux-x86_64-4.0.4/* mongodb # 将mongodb-linux-x86_64-4.0.4文件夹重命名为mongodb
```
* 配置mongodb数据库
```shell
# #创建数据及日志的存放目录
$ mkdir /var/mongodb
$ mkdir /var/mongodb/data
$ mkdir /var/mongodb/logs
# #添加为开机自启项
$ vim /etc/rc.d/rc.local # rc.local CentOS开机自启配置文件
# #按i键进入编辑模式在打开的文件末尾添加:
$ /usr/local/mongodb/bin/mongod --dbpath=/var/mongodb/data --logpath /var/mongodb/logs/log.log --logappend --auth --port 27017 --fork # 执行mongodb → --dbpath指定数据存放路径 → --logpath指定日志存放路径 → 使用--logappend（追加）的方式写日志 → --auth启用验证 → --port指定端口号 → --fork后台执行
# #按ESC键退出编辑模式，按:键执行命令：
$ wq # 保存并推出vim编辑
$ /usr/local/mongodb/bin/mongod --dbpath=/var/mongodb/data --logpath /var/mongodb/logs/log.log --logappend --auth --port 27017 --fork # 第一次运行需要手动启动
```
* 验证
```shell
$ cd /usr/local/mongodb/bin/
$ ./mongo
MongoDB shell version v4.0.4
connecting to: mongodb://127.0.0.1:27017
Implicit session: session { "id" : UUID("76bc4ecd-5b85-4d9d-b1da-a1b97bf48836") }
MongoDB server version: 4.0.4
$ use admin
switched to db admin
# #创建最高权限用户：
$ db.createUser({
    user: "myAdmin",
    pwd: "******",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  })
# user用户名  pwd密码  role权限  db数据库名称
$ db.auth("myAdmin", "******") #登录用户
1
$ show dbs # 登录之后使用此命令将可以访问已有数据库
admin                  0.000GB
config                 0.000GB
local                  0.000GB
# #此时，登录了最高权限用户就可以创建项目中需要的数据库.
# #创建可读写用户：
$ db.createUser(
  {
    user: "fAdmin",
    pwd: "******",
    roles: [ { role: "readWrite", db: "first-db" }]
  })
```
* 在node项目中数据库的链接变化
```
本地项目：
mongodb://localhost/first-db
服务器中项目：
mongodb://fAdmin:******@127.0.0.1:27017/first-db
(mongodb://用户名:登陆密码@127.0.0.1/数据库名称)
```
## 本地项目上传
* 本地终端中输入命令：
```shell
$ scp -r 本地项目目录 root@公网ip:上传到服务器的位置
# #例如：
$ scp -r /media/laowang/办公/_web前端/node/code/node-app root@39.xxx.xxx.18:/home # 在输入对应服务器密码后，这个项目将上传到云服务器的/home目录下
```
## 进程挂载
* 在服务器中，node项目的ip地址修改
```javascript
const Port = 80; // 默认端口号，即在通过ip地址或域名访问网站时不需要输入端口号
const IpAdress = "0.0.0.0";
app.listen(port, IpAdress);
```
* 服务器终端中进入项目文件夹：
```shell
$ cd /home/node-app/
$ npm install # 下载相关依赖
$ node app.js
```
* 运行成功后可以在浏览器中通过公网ip访问项目，但关闭终端(即切断SSH连接)，ip地址无效
> *解决办法： **nohup** 命令让程序在关闭窗口（切换SSH连接）后程序还能继续在后台运行*
```shell
# #Ctrl + c 结束node进程
$ nohup node app.js &
```
> *使用**pm2**能够更优秀的管理后台程序*
```shell
# # 由于node程序正在执行，所以需要先结束它；该node项目占用了80端口号，可以直接通过端口号查询该进程的pid编号
$ fuser -n tcp 80 # 查看已被占用的端口号80的pid编号
$ kill pid编号 # 杀死该进程
$ npm i pm2 -g # 全局下载安装pm2
$ ln -s /usr/local/src/node-v10.14.1-linux-x64/bin/pm2 /usr/local/bin/pm2 # 配置环境变量，以便任何位置都能访问pm2
