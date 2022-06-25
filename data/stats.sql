Use Demo
Go


-- tableplus.com/blog/2018/09/ms-sql-server-how-to-get-date-only-from-datetime-value.html

DECLARE @DayNum AS varchar(10);
SET @DayNum = '1981/02/06';

select CAST(dt_iso AS Date), * from kingston_1981
where CONVERT(VARCHAR(10), dt_iso, 111) = @DayNum;




select max(temp) as maxtemp from kingston_1981
where CONVERT(VARCHAR(10), dt_iso, 111) = @DayNum;
select min(temp) as mintemp from kingston_1981
where CONVERT(VARCHAR(10), dt_iso, 111) = @DayNum;




/*
-- AVG for year
SELECT AVG(temp) AS average FROM kingston_1981;

-- MAX for year
SELECT MAX(temp) AS max_temp FROM kingston_1981;


-- MIN for year
SELECT MIN(temp) AS min_temp FROM kingston_1981;

-- MODE for year
SELECT temp, COUNT(temp) AS mode 
FROM kingston_1981
GROUP BY temp
ORDER BY mode DESC;

*/