let { Task } = require('core-modules/task');
let { Sqlite } = require('core-modules/sqlite');

const SQLITEDB_FILENAME = 'testdb.sqlite';

describe('Task', function() {
    var async = new AsyncSpec(this);

    async.it('should execute async', function(done) {
        let getPromiseResolvedOnTimeoutWithValue = function(timeout, value) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    resolve(value);
                }, timeout);
            });
        };

        Task.spawn(function* () {
            let myPromise = getPromiseResolvedOnTimeoutWithValue(10, "Value");
            let result = yield myPromise;
            expect(result).toEqual('Value');

            result = '';
            for (let i = 0; i < 3; i++) {
                result += yield getPromiseResolvedOnTimeoutWithValue(5, "!");
            }
            expect(result).toEqual('!!!');
            return 'result';
        }).then(function (result) {
            expect(result).toEqual('result');
            done();
        });
    });
});

describe('Sqlite', function() {
    var async = new AsyncSpec(this);

    async.it('should execute queries', function(done) {
        Sqlite.openConnection({path: SQLITEDB_FILENAME}).then(
            function onOpen(conn) {
                conn.execute("SELECT 1").then(
                    function onStatementComplete(result) {
                        expect(result[0].getResultByIndex(0)).toEqual(1);
                        conn.close().then(done);
                    }
                )
            }
        );
    });
});

describe('Sqlite and Task', function () {
    var async = new AsyncSpec(this);

    async.it('should work together', function (done) {
        Task.spawn(function* demoDatabase() {
            let conn = yield Sqlite.openConnection({path: SQLITEDB_FILENAME});

            try {
                let result = yield conn.execute("SELECT 1");
                expect(result[0].getResultByIndex(0)).toEqual(1);
            } finally {
                yield conn.close();

                if(fs.exists(SQLITEDB_FILENAME))
                    fs.remove(SQLITEDB_FILENAME);

                done();
            }
        });
    });
});