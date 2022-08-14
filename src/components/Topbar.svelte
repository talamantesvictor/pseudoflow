<script></script>

<div id="topbar">
   <div class="left" />
   <div class="middle">
      <div id="fileinfo">
         <span>File:</span>
         <span>pseudocode.pff</span>
      </div>
      <div id="runbutton">Run</div>
   </div>
   <div class="right" />
</div>

<style lang="scss">
   #topbar {
      width: 100vw;
      height: 3rem;
      background-color: #2d303d;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .middle {
         display: flex;

         #fileinfo {
            background-color: #3f4254;
            width: 300px;
            height: 1.8rem;
            border-radius: 0.5rem;
            padding: 0 0.8rem;
            display: flex;
            align-items: center;
            margin-right: 0.8rem;

            span {
               opacity: 0.5;
            }

            span:first-child {
               font-weight: bold;
               margin-right: 0.3rem;
            }
         }

         #runbutton {
            background-color: black;
            color: #00bbd3;
            height: 1.8rem;
            text-align: center;
            padding: 0 1.4rem;
            border-radius: 1rem;
            display: flex;
            align-items: center;
         }
      }
   }
</style>
