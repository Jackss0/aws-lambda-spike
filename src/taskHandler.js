const { v4 } = require('uuid')
const AWS = require('aws-sdk')

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = 'TaskTable';

const addTask = async (event) => {

    const { title, description } = JSON.parse(event.body);
    const createdAt = new Date().toDateString();
    const id = v4();

    let newTask = {
        id,
        title,
        description,
        createdAt
    }

    await dynamoDb.put({
        TableName: tableName,
        Item: newTask
    }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify(newTask)
    }
};

const getTasks = async () => {

    try {
        const result = await dynamoDb.scan({
            TableName: 'TaskTable'
        }).promise();

        const tasks = result.Items;

        return {
            status: 200,
            body: {
                tasks
            }
        }
    } catch (error) {
        console.log(error);
    }
}

const getTask = async (event) => {
    const { id } = event.pathParameters;

    try {
        const result = await dynamoDb.get({
            TableName: tableName,
            Key: { id },
        }).promise();

        const task = result.Item;

        return {
            status: 200,
            body: task
        }
    } catch (error) {
        console.log(error);
    }
}

const updateTask = async (event) => {
    const { id } = event.pathParameters;
    const { title, description } = JSON.parse(event.body);

    await dynamoDb.update({
        TableName: tableName,
        Key: { id },
        UpdateExpression: 'set title = :title, description = :description',
        ExpressionAttributeValues: {
            ':title': title,
            ':description': description,
        },
        ReturnValues: 'ALL_NEW'
    }).promise();

    return {
        status: 200,
        body: JSON.stringify({
            message: "Task updated successfully"
        })
    }
}

const deleteTask = async (event) => {
    const { id } = event.pathParameters;

    try {
        await dynamoDb.delete({
            TableName: tableName,
            Key: { id }
        }).promise();

        return {
            status: 200,
            body: {
                message: "Task deleted successfully"
            }
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    addTask, getTasks, getTask, updateTask, deleteTask
}